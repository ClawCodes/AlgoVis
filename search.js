class MinPriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        this.items.push({ element, priority });
        this.items.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class Graph {
    constructor(nodes, links) {
        this.graph = new Map();
        nodes.forEach(node => this.graph.set(node.id, []))
        for (let i = 0; i < links.length; i++) {
            let link = links[i];
            this.graph.get(link.source).push({target: link.target, weight: parseInt(link.weight)});
            this.graph.get(link.target).push({target: link.source, weight: parseInt(link.weight)}); // bidirectional edges
        }
    }

    constructPath(previous, start, end) {
        const path = [];
        let current = end;

        while (current != null) {
            path.unshift(current);
            current = previous.get(current);
        }

        return path[0] === start ? path : [];
    }

    async highlightNode(node) {
        d3.select(`.node[id='${node}']`).attr("fill", "blue");
        await sleep(1000);
    }

    async dijkstra(start, end) {
        const distances = new Map();
        const previous = new Map();
        const visited = new Set();
        const queue = new MinPriorityQueue();

        // Initialize all nodes with inf weight
        for (const node of this.graph.keys()) {
            distances.set(node, Infinity);
        }
        distances.set(start, 0);
        queue.enqueue(start, 0);

        while (!queue.isEmpty()) {
            const {element: current, priority: currentDist} = queue.dequeue();

            if (visited.has(current)) continue;
            visited.add(current);

            // Highlight node to visit and sleep for visual effect
            if (current !== start && current !== end) {
                await this.highlightNode(current);
            }

            if (current === end) break;

            for (const neighbor of this.graph.get(current)) {
                const {target, weight} = neighbor;
                const weightFromOrigin = currentDist + weight;

                if (weightFromOrigin < distances.get(target)) {
                    distances.set(target, weightFromOrigin);
                    previous.set(target, current);
                    queue.enqueue(target, weightFromOrigin);
                }
            }
        }

        return this.constructPath(previous, start, end);
    }
}