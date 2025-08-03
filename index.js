import { Graph } from "./search.js";

var startSelected = false;
var endSelected = false;

const startColor = "#598a59"
const endColor = "#da8686"
const pathColor = "#7092cf"

let searchGraph = undefined;

const selectionPrompt = document.getElementById("startEndPrompt");

/**
 * Generate Node and link arrays used for creating the D3 force simulation.
 * Overall the graph is populated as a NxN grid where N = sqrt(NodeCount)
 * then fill in the grid as much as possible (this can leave some points in the grid unpopulated)
 * @param {number} nodeCount
 */
function generateNodeTemplate(nodeCount){
    const size = Math.ceil(Math.sqrt(nodeCount)); // grid width and height (NxN)
    const nodes = [];
    const links = [];

    // Create nodes with id for link generation and selection
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({ id: i.toString() });
    }

    for (let i = 0; i < nodeCount; i++) {
        const col = i % size;

        // Link to right neighbor
        if (col < size - 1 && i + 1 < nodeCount) {
            links.push({
                source: i.toString(),
                target: (i + 1).toString(),
                weight: (Math.floor(Math.random() * 10) + 1).toString() // randomly generate weight
            });
        }

        // Link to bottom neighbor
        if (i + size < nodeCount) {
            links.push({
                source: i.toString(),
                target: (i + size).toString(),
                weight: (Math.floor(Math.random() * 10) + 1).toString() // randomly generate weight
            });
        }
    }

    return [nodes, links]
}

function selectStart(elem) {
    elem
        .attr("fill", startColor)
        .attr("start", "true")
        .text("start")
    startSelected = true;
}

function unselectStart(elem) {
    elem
        .attr("fill", "white")
        .attr("start", "false")
    startSelected = false;
}

function selectEnd(elem) {
    elem
        .attr("fill", endColor)
        .attr("end", "true")
        .text("end")
    endSelected = true;
}

function unselectEnd(elem) {
    elem
        .attr("fill", "white")
        .attr("end", "false")
    endSelected = false;
}


function hideFindPath(hide){
    document.getElementById("findPath").hidden = hide;
}

function updatePrompt(){
    if (startSelected){
        if (endSelected){
            selectionPrompt.innerHTML = "";
            hideFindPath(false);
        } else {
            selectionPrompt.innerHTML = "Select end node";
            hideFindPath(true);
        }
    } else {
        if (endSelected){
            selectionPrompt.innerHTML = "Select start node";
        } else {
            selectionPrompt.innerHTML = "Select start and end node";
        }
        hideFindPath(true);
    }
}

function selectNode(event, d) {
    var elem = d3.select(this)
    var isStart = elem.attr("start") === "true"
    var isEnd = elem.attr("end") === "true"

    if (startSelected) {
        if (isStart) {
            unselectStart(elem);
            updatePrompt();
            return
        }
        if (endSelected) {
            if (isEnd) {
                unselectEnd(elem);
            }
        } else {
            selectEnd(elem)
        }
    } else {
        if (endSelected) {
            if (isEnd) {
                unselectEnd(elem);
            } else {
                selectStart(elem)
            }
        } else {
            selectStart(elem)
        }
    }
    updatePrompt();
}

function drag(simulation) {
    return d3.drag()
        .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        })
        .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        })
        .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        });
}

function generateGraph(nodeCount) {
    const svg = d3.select("#graphCanvas");

    const [nodes, links] = generateNodeTemplate(nodeCount);

    searchGraph = new Graph(nodes, links);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(500, 300));

    const link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    const linkLabels = svg.selectAll(".linkLabel")
        .data(links)
        .enter()
        .append("text")
        .attr("class", "linkLabel")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(d => d.weight);

    const node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("id", d => d.id)
        .attr("r", 30)
        .attr("fill", "white")
        .attr("start", "false")
        .attr("end", "false")
        .call(drag(simulation))
        .on("click", selectNode);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        linkLabels
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);
    });

    updatePrompt();
}


function cleanSVGCanvas(){
    d3.select("#graphCanvas").selectAll("*").remove(); // Remove all children from SVG (clear prior graph if any)
    startSelected = false;
    endSelected = false;
}

document.getElementById("generate").addEventListener("click", () => {
    const nodeCount = parseInt(document.getElementById("nodeCount").value, 10);

    if (isNaN(nodeCount) || nodeCount < 1) {
        alert("Please enter a valid number of nodes.");
        return;
    }

    cleanSVGCanvas();

    generateGraph(nodeCount);
});


function highlightPath(path){
    const start = path.at(0);
    const end = path.at(-1);

    d3.selectAll(".node").each(function(d){
        const nodeId = d.id;
        if (path.includes(nodeId)) {
            if (nodeId === start) {
                d3.select(this).attr("fill", startColor);
            } else if (nodeId === end) {
                d3.select(this).attr("fill", endColor);
            } else {
                d3.select(this).attr("fill", pathColor);
            }
        } else {
            d3.select(this).attr("fill", "white");
        }
    })
}

document.getElementById("findPath").addEventListener("click", async () => {
    if (searchGraph === undefined) {
        throw new Error("Please enter a valid search graph.");
    }

    const startNode = d3.select(".node[start='true']").datum().id;
    const endNode = d3.select(".node[end='true']").datum().id;

    const path = await searchGraph.dijkstra(startNode, endNode);

    highlightPath(path);
})