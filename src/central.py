import numpy as np

def power_iteration(adjacency_matrix, epsilon):
    n = adjacency_matrix.shape[0]  # Number of nodes
    p = np.ones(n)  # Initial vector

    while True:
        q = np.dot(adjacency_matrix.T, p)  # Eigenvector estimate
        i = np.argmax(q)  # Maximum value index
        lamda = q[i] / p[i]  # Eigenvalue estimate
        q = q / q[i]  # Scale vector
        if np.linalg.norm(q - p) <= epsilon:  # Convergence check
            p = q
            break
        p = q
        

    p /= np.linalg.norm(p)  # Normalize final eigenvector
    return p, lamda

# Example usage
n = 5  # Number of nodes
adjacency_matrix = np.random.rand(n, n)  # Random adjacency matrix
print(adjacency_matrix)
epsilon = 1e-6  # Convergence threshold

centrality_vector, eigenvalue = power_iteration(adjacency_matrix, epsilon)
print("Web Centralities:", centrality_vector)
print("Dominant Eigenvalue:", eigenvalue)