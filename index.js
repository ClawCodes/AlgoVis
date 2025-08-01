import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

class Node {

    static createNode(){
        return new Node();
    }
}

window.onload = async function() {
    console.log("loaded!");

    var graph = {
        nodes: [
            {id:1},
            {id:2}
        ], // Iterable of node objects -> need to create factory func for nodes
        links: [{source: 1, target: 2}]
    }

    var simulation = d3.forceSimulation
}
