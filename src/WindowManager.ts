import type Panel from "./lib/Panel.svelte";

window.addEventListener("resize", update_all_panel_positions);

let panels = [];

// enup of up, down, left, right
enum Direction {
    TOP,
    BOTTOM,
    LEFT,
    RIGHT,
}

let defaultPanelPositions = [
    {
        name: "workspace",
        left: 0.2,
        top: 0,
        width: 0.6,
        height: 0.8,
    },
    {
        name: "output",
        left: 0.2,
        top: 0.8,
        width: 0.6,
        height: 0.2,
    },
    { 
        name: "toolbox", 
        left: 0, 
        top: 0, 
        width: 0.2, 
        height: 1 
    },
    {
        name: "explorer",
        left: 0.8,
        top: 1/3,
        width: 0.2,
        height: 2/3,
    },
    {
        name: "properties",
        left: 0.8,
        top: 0,
        width: 0.2,
        height: 1/3,
    },
];

export function setPanelDefaults(panel: Panel) {
    let defaultPanelPosition = defaultPanelPositions.find(
        (defaultPanelPosition) => {
            return defaultPanelPosition.name == panel.getName().toLowerCase();
        }
    );

    if (defaultPanelPosition) {
        console.log("setting default panel position for " + panel.getName());

        // set absolute position
        panel.setPosition(percent_to_px(defaultPanelPosition.left, "width"), percent_to_px(defaultPanelPosition.top, "height"));
        panel.setSize(percent_to_px(defaultPanelPosition.width, "width"), percent_to_px(defaultPanelPosition.height, "height"));

        // set relative position
        panel.setRelativePosition(defaultPanelPosition.left, defaultPanelPosition.top);
        panel.setRelativeSize(defaultPanelPosition.width, defaultPanelPosition.height);

    }
}

export function update_all_panel_positions() {
    // foreach panel
    panels.forEach((panel) => {
        // set panel position to calculated position
        
        let relativePanelPosition = panel.getRelativePosition();
        let relativePanelSize = panel.getRelativeSize();

        panel.setPosition(percent_to_px(relativePanelPosition.x, "width"), percent_to_px(relativePanelPosition.y, "height"));
        panel.setSize(percent_to_px(relativePanelSize.width, "width"), percent_to_px(relativePanelSize.height, "height"));

        apply_gap(5, panel);
    });
}

function apply_gap(gap:number, panel: Panel){
    
    // get the panel's current position
    let panel_position = panel.getPosition();
    let panel_size = panel.getSize();

    // apply the gap
    panel.setPosition(panel_position.x + gap, panel_position.y + gap);
    panel.setSize(panel_size.width - gap*2, panel_size.height - gap*2);
}

function percent_to_px(percent: number, dimension: string) {

    // get bodyDiv bounding box
    let bodyDivBoundingBox = fetchBodyDiv().getBoundingClientRect();

    // get the size of the dimension
    if (dimension == "width") var window_dimension = bodyDivBoundingBox.width;
    else if (dimension == "height") var window_dimension = bodyDivBoundingBox.height;

    // calculate the pixel value
    let pixel_value = percent * window_dimension;

    return pixel_value;
}

function fetchBodyDiv() {
    return document.getElementById("body");
}

export function register_panel(panel: Panel) {
    console.log("registering panel: " + panel.getName());
    panels.push(panel);

    setPanelDefaults(panel);
    apply_gap(5, panel);
    update_panels();
}

export function update_panels() {
    console.log("updating panels");

    panels.forEach((panel) => {
        panel.updateTransform();
    });
}

export function onPanelDrag(mouseX: number, mouseY: number){
    let indicatorTransform = get_snap_position(mouseX, mouseY);

    if (indicatorTransform) {
        display_panel_indicator(
            indicatorTransform.position.x, 
            indicatorTransform.position.y, 
            indicatorTransform.size.width, 
            indicatorTransform.size.height
        );
    }
}

export function onPanelDragEnd(mouseX: number, mouseY: number){


    // get snap position
    let indicatorTransform = get_snap_position(mouseX, mouseY);

    // if there is a snap position
    if (indicatorTransform) {
        // snap the current dragging panel to the snap position
        let panel = panels.find((panel) => {
            return panel.isDragging();
        });

        // set the panel's relative position
        panel.setRelativePosition(indicatorTransform.position.x, indicatorTransform.position.y);
        panel.setRelativeSize(indicatorTransform.size.width, indicatorTransform.size.height);


        if (indicatorTransform.otherPanel) {
            // set the offset panel's position
            indicatorTransform.otherPanel.setRelativePosition(indicatorTransform.otherPanelNewPosition.x, indicatorTransform.otherPanelNewPosition.y);
            indicatorTransform.otherPanel.setRelativeSize(indicatorTransform.otherPanelNewSize.width, indicatorTransform.otherPanelNewSize.height);
        
            // update the offset panel's transform
            update_panel_position(indicatorTransform.otherPanel);
        }

        // update the panel's transform
        update_panel_position(panel);
    
    }
    else{
        // error
        console.error("no snap position found");
    }

    // hide the indicator
    hide_panel_indicator();
}

export function fill_remaining_space(){
    // for every panel
    panels.forEach((panel) => {
        // check if the panel has space above it
        let panel_relative_position = panel.getRelativePosition();
        let panel_relative_size = panel.getRelativeSize();


    });
}

export function update_panel_position(panel: Panel){
    // read relative position
    let panel_relative_position = panel.getRelativePosition();
    let panel_relative_size = panel.getRelativeSize();

    // convert relative position to pixels
    let panel_position = {
        x: percent_to_px(panel_relative_position.x, "width"),
        y: percent_to_px(panel_relative_position.y, "height"),
    };

    let panel_size = {
        width: percent_to_px(panel_relative_size.width, "width"),
        height: percent_to_px(panel_relative_size.height, "height"),
    };

    // set the panel's position
    panel.setPosition(panel_position.x, panel_position.y);
    panel.setSize(panel_size.width, panel_size.height);

    // apply gap
    apply_gap(5, panel);

    // update the panel's transform
    panel.updateTransform();
}

export function display_panel_indicator(x:number, y:number, width:number, height:number){

    console.log("displaying panel indicator", x*100, y*100, width*100, height*100);

    let indicator = document.getElementById("panel_indicator");
    indicator.style.display = "block";
    indicator.style.left = x*100 + "%";
    indicator.style.top = y*100 + "%";
    indicator.style.width = width*100 + "%";
    indicator.style.height = height*100 + "%";
}

export function hide_panel_indicator(){
    let indicator = document.getElementById("panel_indicator");
    indicator.style.display = "none";
}

export function get_snap_position(mouseX: number, mouseY: number){
    // for every panel
    for (let i = 0; i < panels.length; i++) {
        let panel = panels[i];

        // if the panel is the one being dragged, skip it
        if (panel.isDragging()) continue;

        // get the panel's relative position then convert it to pixels
        let panel_relative_position = panel.getRelativePosition();
        let panel_relative_size = panel.getRelativeSize();

        let panel_position = {
            x: percent_to_px(panel_relative_position.x, "width"),
            y: percent_to_px(panel_relative_position.y, "height"),
        };

        let panel_size = {
            width: percent_to_px(panel_relative_size.width, "width"),
            height: percent_to_px(panel_relative_size.height, "height"),
        };

        // if the mouse is not over the panel, skip it
        if (mouseX < panel_position.x || mouseX > panel_position.x + panel_size.width) continue;
        if (mouseY < panel_position.y || mouseY > panel_position.y + panel_size.height) continue;

        // if the mouse is in the upper fifth of the panel, snap to the top
        if (mouseY < panel_position.y + panel_size.height / 5) {
            return {
                position:{
                    x: panel_relative_position.x,
                    y: panel_relative_position.y,
                },
                size:{
                    width: panel_relative_size.width,
                    height: panel_relative_size.height/2,
                },
                otherPanel: panel,
                otherPanelNewPosition: {x: panel_relative_position.x, y: panel_relative_position.y + panel_relative_size.height/2},
                otherPanelNewSize: {width: panel_relative_size.width, height: panel_relative_size.height/2},
            };
        }

        // if the mouse is in the lower fifth of the panel, snap to the bottom
        if (mouseY > panel_position.y + panel_size.height * 4 / 5) {
            return {
                position:{
                    x: panel_relative_position.x,
                    y: panel_relative_position.y + panel_relative_size.height/2,
                },
                size:{
                    width: panel_relative_size.width,
                    height: panel_relative_size.height/2,
                },
                otherPanel: panel,
                otherPanelNewPosition: {x: panel_relative_position.x, y: panel_relative_position.y},
                otherPanelNewSize: {width: panel_relative_size.width, height: panel_relative_size.height/2},
            };
        }

        // if the mouse is on the left side of the panel, snap to the left
        if (mouseX < panel_position.x + panel_size.width / 2) {
            return {
                position:{
                    x: panel_relative_position.x,
                    y: panel_relative_position.y,
                },
                size:{
                    width: panel_relative_size.width/2,
                    height: panel_relative_size.height,
                },
                otherPanel: panel,
                otherPanelNewPosition: {x: panel_relative_position.x + panel_relative_size.width/2, y: panel_relative_position.y},
                otherPanelNewSize: {width: panel_relative_size.width/2, height: panel_relative_size.height},
            };
        }

        // if the mouse is on the right side of the panel, snap to the right
        if (mouseX > panel_position.x + panel_size.width / 2) {
            return {
                position:{
                    x: panel_relative_position.x + panel_relative_size.width/2,
                    y: panel_relative_position.y,
                },
                size:{
                    width: panel_relative_size.width/2,
                    height: panel_relative_size.height,
                },
                otherPanel: panel,
                otherPanelNewPosition: {x: panel_relative_position.x, y: panel_relative_position.y},
                otherPanelNewSize: {width: panel_relative_size.width/2, height: panel_relative_size.height},
            };
        }
    }
    let draggingPannel = undefined;

        // get dragging panel
        panels.forEach((panel) => {
            if (panel.isDragging()) {
                draggingPannel = panel;
                console.log("dragging panel: " + panel.getName());
            }
        });

        if (draggingPannel) {
            // return the panel's position and size
            return {
                position:{
                    x: draggingPannel.getRelativePosition().x,
                    y: draggingPannel.getRelativePosition().y,

                },

                size:{
                    width: draggingPannel.getRelativeSize().width,
                    height: draggingPannel.getRelativeSize().height,
                },
                otherPanel: undefined,
                otherPanelNewPosition: undefined,
                otherPanelNewSize: undefined,
            };
        }

        // erorr
        console.error("error getting snap position");
}