import { dijkstra } from "./geodesic_distance";
import { FibonacciHeap } from "@tyriar/fibonacci-heap";

export function farthestPointSampling({ graph, qType, source, count, logger }) {
    const { distances } = dijkstra({ graph, qType, source, logger: undefined });
    const allDistances = new Set([distances]);

    const farthestPoints = new Set();

    let startTime, elapsedTime;

    startTime = new Date();
    logger && logger.log(`Executing Farthest Point Sampling...`);

    for (let i = 0; i < count; i++) {
        const cluster = new FibonacciHeap();

        graph.vertices.forEach(vertex => {
            let minDistance = Infinity;

            allDistances.forEach(distances => {
                const distance = distances.get(vertex);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            });

            cluster.insert(-minDistance, vertex);
        });

        const point = cluster.extractMinimum().value;
        allDistances.add(dijkstra({ graph, qType, source: point, logger: undefined }).distances);

        farthestPoints.add(point);
    }

    elapsedTime = new Date() - startTime;
    logger && logger.log(`\tdone in ${elapsedTime}ms.`);

    return {
        farthestPoints,
    };
}
