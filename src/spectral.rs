//! Spectral ranking via power iteration for eigenvector centrality.

use wasm_bindgen::prelude::*;

/// Run power iteration to find the dominant eigenvector of a square matrix.
fn power_iteration(adj: &[Vec<f64>], iterations: usize, tolerance: f64) -> Vec<f64> {
    let n = adj.len();
    if n == 0 {
        return vec![];
    }

    let mut vec = vec![1.0 / n as f64; n];

    for _ in 0..iterations {
        let mut new_vec = vec![0.0; n];
        for i in 0..n {
            for j in 0..n {
                new_vec[i] += adj[i][j] * vec[j];
            }
        }

        let norm: f64 = new_vec.iter().map(|x| x * x).sum::<f64>().sqrt();
        if norm < tolerance {
            break;
        }
        for v in new_vec.iter_mut() {
            *v /= norm;
        }

        let delta: f64 = new_vec
            .iter()
            .zip(vec.iter())
            .map(|(a, b)| (a - b).abs())
            .sum();

        vec = new_vec;

        if delta < tolerance {
            break;
        }
    }

    vec
}

/// Flatten a row-major adjacency matrix from a flat f64 array + dimension.
fn unflatten(flat: &[f64], n: usize) -> Vec<Vec<f64>> {
    let mut adj = vec![vec![0.0; n]; n];
    for i in 0..n {
        for j in 0..n {
            adj[i][j] = flat[i * n + j];
        }
    }
    adj
}

/// Compute spectral ranking from a flat adjacency matrix.
///
/// `flat_adjacency` is a row-major flat array of size n*n.
/// `n` is the matrix dimension.
///
/// Returns indices sorted by eigenvector centrality (highest first).
#[wasm_bindgen(js_name = spectralRank)]
pub fn spectral_rank(flat_adjacency: &[f64], n: usize) -> Vec<usize> {
    if n == 0 {
        return vec![];
    }
    let adj = unflatten(flat_adjacency, n);
    let eigenvector = power_iteration(&adj, 200, 1e-10);

    let mut indices: Vec<usize> = (0..n).collect();
    indices.sort_by(|&a, &b| {
        eigenvector[b]
            .partial_cmp(&eigenvector[a])
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    indices
}

/// Compute raw eigenvector centrality scores from a flat adjacency matrix.
#[wasm_bindgen(js_name = eigenvectorCentrality)]
pub fn eigenvector_centrality(flat_adjacency: &[f64], n: usize) -> Vec<f64> {
    if n == 0 {
        return vec![];
    }
    let adj = unflatten(flat_adjacency, n);
    power_iteration(&adj, 200, 1e-10)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn flatten(adj: &[Vec<f64>]) -> (Vec<f64>, usize) {
        let n = adj.len();
        let mut flat = vec![0.0; n * n];
        for i in 0..n {
            for j in 0..n {
                flat[i * n + j] = adj[i][j];
            }
        }
        (flat, n)
    }

    #[test]
    fn test_empty_matrix() {
        let result = spectral_rank(&[], 0);
        assert!(result.is_empty());
    }

    #[test]
    fn test_single_node() {
        let (flat, n) = flatten(&vec![vec![1.0]]);
        let result = spectral_rank(&flat, n);
        assert_eq!(result, vec![0]);
    }

    #[test]
    fn test_two_nodes_symmetric() {
        let adj = vec![vec![0.0, 1.0], vec![1.0, 0.0]];
        let (flat, n) = flatten(&adj);
        let result = spectral_rank(&flat, n);
        assert_eq!(result.len(), 2);
    }

    #[test]
    fn test_star_graph() {
        let n = 5;
        let mut adj = vec![vec![0.0; n]; n];
        for i in 1..n {
            adj[0][i] = 1.0;
            adj[i][0] = 1.0;
        }
        let (flat, n) = flatten(&adj);
        let result = spectral_rank(&flat, n);
        assert_eq!(result[0], 0);
    }
}
