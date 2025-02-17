import { FibonacciHeap } from "@tyriar/fibonacci-heap";

import { Q_TYPES } from "../constants";
import store from "../components/Store";

import MinSet from "./MinSet";
import MinHeap from "./MinHeap";

export const dijkstra = (qType, source, targets = []) => {
    const logger = store;
    const { graph } = store;
    let startTime, elapsedTime;

    startTime = new Date();
    logger && logger.log("Initializing Dijkstra sets...");

    // 1  function Dijkstra(Graph, source):
    // 2
    // 3      create vertex set Q
    let Q;
    switch (Q_TYPES[qType]) {
        case Q_TYPES.Set:
            logger && logger.log("\tUsing a Set.");
            Q = new MinSet();
            break;
        case Q_TYPES.MinHeap:
            logger && logger.log("\tUsing a Min Heap.");
            Q = new MinHeap();
            break;
        case Q_TYPES.FibonacciHeap:
            logger && logger.log("\tUsing a Fibonacci Heap.");
            Q = new FibonacciHeap();
            break;
    }

    const distances = new Map();
    const previous = new Map();
    const nodeMapping = new Map();

    // 4
    // 5      for each vertex v in Graph:
    // 6          dist[v] ← INFINITY
    // 7          prev[v] ← UNDEFINED
    // 8          add v to Q
    // 10      dist[source] ← 0
    graph.vertices.forEach((v) => {
        const vDistance = v === source ? 0 : Infinity;
        distances.set(v, vDistance);
        previous.set(v, undefined);
        nodeMapping.set(v, Q.insert(vDistance, v));
    });

    elapsedTime = new Date() - startTime;
    logger && logger.log(`\tdone in ${elapsedTime.toLocaleString()}ms.`);

    startTime = new Date();
    logger && logger.log(`Finding shortest paths...`);

    // 11
    // 12      while Q is not empty:
    // 13          u ← vertex in Q with min dist[u]
    // 14
    // 15          remove u from Q
    let u = undefined;
    let encounteredTargetsCount = 0;
    while (!Q.isEmpty()) {
        const u = Q.extractMinimum().value;

        if (targets.includes(u)) {
            encounteredTargetsCount++;
        }

        if (encounteredTargetsCount > 0 && encounteredTargetsCount === targets.length) {
            logger && logger.log(`\tAll given targets reached, exiting early...`);
            break;
        }

        // 16
        // 17          for each neighbor v of u:
        // 18              alt ← dist[u] + length(u, v)
        // 19              if alt < dist[v]:
        // 20                  dist[v] ← alt
        // 21                  prev[v] ← u
        graph.neighbors(u).forEach((v) => {
            const alt = distances.get(u) + graph.edge(u, v);
            if (alt < distances.get(v)) {
                Q.decreaseKey(nodeMapping.get(v), alt);
                distances.set(v, alt);
                previous.set(v, u);
            }
        });
    }

    elapsedTime = new Date() - startTime;
    logger && logger.log(`\tdone in ${elapsedTime.toLocaleString()}ms.`);

    // 22
    // 23      return dist[], prev[]
    return {
        distances,
        previous,
        target: u,
    };
};

export const traverse = (distances, previous, source, target) => {
    const logger = store;
    let startTime, elapsedTime;

    // 1  S ← empty sequence
    // 2  u ← target
    // 3  if prev[u] is defined or u = source:          // Do something only if the vertex is reachable
    // 4      while u is defined:                       // Construct the shortest path with a stack S
    // 5          insert u at the beginning of S        // Push the vertex onto the stack
    // 6          u ← prev[u]                           // Traverse from target to source
    startTime = new Date();
    logger && logger.log(`Traversing shortest path...`);

    const S = [];
    let u = target;

    if (previous.get(u) || u === source) {
        while (u) {
            S.unshift(u);
            u = previous.get(u);
        }
    }

    elapsedTime = new Date() - startTime;
    logger && logger.log(`\tdone in ${elapsedTime.toLocaleString()}ms.`);

    return {
        distance: distances.get(target),
        path: S,
    };
};

export function findGeodesicDistance({ qType, source, target }) {
    const { distances, previous } = dijkstra(qType, source, [target]);

    return traverse(distances, previous, source, target);
}

export function populateGeodesicDistanceMatrix({ geometry, qType }) {
    const matrix = new Map();

    geometry.vertices.forEach((source) => {
        matrix.set(`${source.x}:${source.y}:${source.z}`, new Map());
        const { distances } = dijkstra(qType, source);

        distances.forEach((distance, target) => {
            matrix
                .get(`${source.x}:${source.y}:${source.z}`)
                .set(`${target.x}:${target.y}:${target.z}`, distance);
        });

        Array.from(matrix.get(`${source.x}:${source.y}:${source.z}`).keys())
            .sort()
            .reduce((accumulator, currentValue) => {
                accumulator[currentValue] = matrix
                    .get(`${source.x}:${source.y}:${source.z}`)
                    .get(currentValue);
                return accumulator;
            }, {});
    });

    Array.from(matrix.keys())
        .sort()
        .reduce((accumulator, currentValue) => {
            accumulator[currentValue] = matrix.get(currentValue);
            return accumulator;
        }, {});

    return {
        matrix,
    };
}
