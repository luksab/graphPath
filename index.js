var cy = cytoscape({

    container: document.getElementById('cy'), // container to render in

    elements: [
        // list of graph elements to start with
        { // node a
            data: { id: 'a' }
        },
        { // node b
            data: { id: 'b' }
        },
        { // edge ab
            data: { id: 'ab', source: 'a', target: 'b' }
        }
    ],

    style: [ // the stylesheet for the graph
        {
            selector: 'node',
            style: {
                'background-color': '#666',
                //'label': 'data(id)'
            }
        },

        {
            selector: 'edge',
            style: {
                'curve-style': 'bezier',
                'width': 3,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'label': 'data(id)'
            }
        }
    ],

    layout: {
        name: 'grid',
        rows: 1
    }

});

document.getElementById("mapReduce").onclick = function() {
    console.log(getLeastSubgraphs(cy.elements()))
    colorComponents(cy)
};
let draggingFrom = false;

function neighbors(node) {
    return node.connectedEdges().map((edge) => edge.target().id() === node.id() ? edge.source() : edge.target());
}

function addNode(neighbors, x = 0, y = 0) {
    newNode = cy.add([{
        group: "nodes",
        id: "testid",
        renderedPosition: {
            x: x,
            y: y,
        },
    }]);
    for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        cy.add([{
            group: "edges",
            data: {
                source: newNode.id(),
                target: neighbor.id()
            }
        }])
    }

    return newNode;
}

function colorComponents(graph) {
    let colors = ["aqua", "darkgoldenrod", "bisque", "chocolate"];
    for (let i = 0; i < graph.elements().components().length; i++) {
        const component = graph.elements().components()[i];
        component.style('line-color', colors[i]);
    }
}


function getLeastSubgraphs(graph) {
    let nodes = []
    ele = graph.filter("node");
    for (let i = 0; i < ele.length; i++) {
        const node = ele[i];
        nodes.push(node);
    }
    //cy.$("#"+nodeIDs[0]);
    let bestNum = Number.MAX_SAFE_INTEGER;
    let bestGraph;

    let result = recursion(0);
    cy.elements().remove();
    bestGraph.restore()
        //console.log(bestGraph.length);
        //cy.add(bestGraph);
    return result;

    function recursion(index) {
        if (index === nodes.length) {
            let score = cy.elements().components().length;
            if (score < bestNum) {
                bestNum = score;
                bestGraph = cy.elements().clone()
                bestGraph.remove();
            }
            return bestNum;
        }
        return split();
        // if (connected.length <= 2) {
        //     return recursion(index + 1);
        // }
        // if (connected.length === 3) {
        //     let results = [];
        //     let edges = node.connectedEdges();
        //     for (i = 0; i < 3; i++) {
        //         let edge = edges[i].remove();
        //         let temp = addNode([connected[i]], node.renderedPosition().x, node.renderedPosition().y);
        //         results.push(recursion(index + 1));
        //         temp.remove()
        //         edge.restore();
        //     }
        //     return Math.min(...results);
        // }
        function split() {
            let node = nodes[index];
            let connected = neighbors(node);
            //console.log(connected.length);
            let edges = node.connectedEdges();
            if (connected.length <= 2) {
                return recursion(index + 1);
            }
            if (connected.length % 2) {
                for (let i = 0; i < connected.length; i++) {
                    let edge = edges[i].remove();
                    let temp = addNode([connected[i]], node.renderedPosition().x, node.renderedPosition().y);
                    split();
                    temp.remove();
                    edge.restore();
                }
            } else
                for (let i = 0; i < connected.length - 1; i++) {
                    for (let j = i + 1; j < connected.length; j++) {
                        let edgeI = edges[i].remove();
                        let edgeJ = edges[j].remove();
                        let temp = addNode([connected[i], connected[j]], node.renderedPosition().x, node.renderedPosition().y);
                        split();
                        temp.remove();
                        edgeI.restore();
                        edgeJ.restore();
                    }
                }
        }
    }
}

//console.log(getLeastSubgraphs(cy.elements()));

cy.on("tap", function(e) {
    console.log(e.originalEvent.shiftKey);
    if (e.target === cy) {
        cy.nodes('[id ="' + draggingFrom + '"]').style('background-color', '#666');
        newNode = cy.add([{
            group: "nodes",
            id: "testid",
            renderedPosition: {
                x: e.renderedPosition.x,
                y: e.renderedPosition.y,
            },
        }]).id();
        if (e.originalEvent.shiftKey && draggingFrom) {
            cy.add([{
                group: "edges",
                data: { source: draggingFrom, target: newNode }
            }])
        } else
            cy.nodes('[id ="' + draggingFrom + '"]').style('background-color', '#666');
        draggingFrom = newNode;
        cy.nodes('[id ="' + draggingFrom + '"]').style('background-color', 'red');
        console.log("making node", draggingFrom);
    } else {
        if (draggingFrom) {
            cy.nodes('[id ="' + draggingFrom + '"]').style('background-color', '#666');
            console.log("making edge from", draggingFrom, "to", e.target.id());
            cy.add([{
                group: "edges",
                data: { source: draggingFrom, target: e.target.id() }
            }])
            cy.nodes('[id ="' + draggingFrom + '"]').style('background-color', '#666');
            draggingFrom = false;
        } else {
            console.log("start edge at", e.target.id());
            cy.nodes('[id ="' + draggingFrom + '"]').style('background-color', '#666');
            draggingFrom = e.target.id();
            cy.nodes('[id ="' + draggingFrom + '"]').style('background-color', 'red');
        }
        //cy.remove(cy.$('#' + e.target.id()))
    }
});

cy.on("cxttap", function(e) {
    if (e.target === cy) {
        console.log("abort drag");
        cy.nodes('[id ="' + draggingFrom + '"]').style('background-color', '#666');
        draggingFrom = false;
    } else {
        console.log("deleting", e.target.id());
        if (e.target.id() === draggingFrom)
            draggingFrom = false;
        cy.remove(cy.$('#' + e.target.id()))
    }
});