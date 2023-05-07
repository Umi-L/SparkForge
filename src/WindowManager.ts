import type Panel from "./lib/Panel.svelte";

window.addEventListener("resize", update_all_panel_positions);

let panels = [];

interface Rect {
    x: number,
    y: number,
    width: number,
    height: number,
}

export function setPanelDefaults(panel: Panel) {
    let defaultPanelPosition = panel.getDefaultTransform();

    if (defaultPanelPosition) {
        // console.log("setting default panel position for " + panel.getName());

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
    // console.log("registering panel: " + panel.getName());
    panels.push(panel);

    setPanelDefaults(panel);
    apply_gap(5, panel);
    // update_panels();
}

// export function update_panels() {
//     // console.log("updating panels");

//     panels.forEach((panel) => {
//         panel.updateTransform();
//     });
// }

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

        let oldPanelPosition = panel.getRelativePosition();
        let oldPanelSize = panel.getRelativeSize();

        // clone old position and size because they are references?
        oldPanelPosition = {x: oldPanelPosition.x, y: oldPanelPosition.y};
        oldPanelSize = {width: oldPanelSize.width, height: oldPanelSize.height};

        // set the panel's relative position
        panel.setRelativePosition(indicatorTransform.position.x, indicatorTransform.position.y);
        panel.setRelativeSize(indicatorTransform.size.width, indicatorTransform.size.height);


        if (indicatorTransform.otherPanel) {
            // set the offset panel's position
            indicatorTransform.otherPanel.setRelativePosition(indicatorTransform.otherPanelNewPosition.x, indicatorTransform.otherPanelNewPosition.y);
            indicatorTransform.otherPanel.setRelativeSize(indicatorTransform.otherPanelNewSize.width, indicatorTransform.otherPanelNewSize.height);
        
            // update the offset panel's transform
            update_panel_position(indicatorTransform.otherPanel);

            if (indicatorTransform.fill){
                // fill the remaining space
                fill_remaining_space(oldPanelPosition.x, oldPanelPosition.y, oldPanelSize.width, oldPanelSize.height);
            }
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

export function fill_remaining_space(x: number, y: number, width: number, height: number){

    console.log("filling remaining space");
    console.log("x: " + x);
    console.log("y: " + y);
    console.log("width: " + width);
    console.log("height: " + height);

    // the rect of the horizontal space to the left of the panel
    let left_rect = {
        x: 0,
        y: y,
        width: x,
        height: height,
    };

    // the rect of the horizontal space to the right of the panel
    let right_rect = {
        x: x + width,
        y: y,
        width: 1 - (x + width),
        height: height,
    };

    // the rect of the vertical space above the panel
    let top_rect = {
        x: x,
        y: 0,
        width: width,
        height: y,
    };

    // the rect of the vertical space below the panel
    let bottom_rect = {
        x: x,
        y: y + height,
        width: width,
        height: 1 - (y + height),
    };

    // display debug rects
    // display_panel_debug_space_check(left_rect, right_rect, top_rect, bottom_rect);

    let topAvalable = panels_in_rect(top_rect);
    let bottomAvalable = panels_in_rect(bottom_rect);
    let leftAvalable = panels_in_rect(left_rect);
    let rightAvalable = panels_in_rect(right_rect);

    console.log("topAvalable: " + topAvalable);
    console.log("bottomAvalable: " + bottomAvalable);
    console.log("leftAvalable: " + leftAvalable);
    console.log("rightAvalable: " + rightAvalable);

    if (topAvalable && bottomAvalable){
        console.log("top and bottom available");

        //split the space vertically on all panels that are on the edge
        let panels_in_rect = get_panels_in_rect(top_rect);

        panels_in_rect.forEach((panel) => {
            // if the panel is bordering the empty space
            if (panel.getRelativePosition().y + panel.getRelativeSize().height == y){
                // stretch the panel to fill half the empty space vertically
                panel.setRelativeSize(panel.getRelativeSize().width, y+height/2 - panel.getRelativePosition().y);
            }
        });

        panels_in_rect = get_panels_in_rect(bottom_rect);

        panels_in_rect.forEach((panel) => {
            // if the panel is bordering the empty space
            if (panel.getRelativePosition().y == y + height){
                // stretch the panel to fill half the empty space vertically
                panel.setRelativeSize(panel.getRelativeSize().width, panel.getRelativePosition().y - y);
                panel.setRelativePosition(panel.getRelativePosition().x, y + height/2);
            }
        });
    } else if (topAvalable){
        console.log("top available");

        // stretch all panels in the top rect to fill the empty space
        let panels_in_rect = get_panels_in_rect(top_rect);

        panels_in_rect.forEach((panel) => {
            // if the panel is bordering the empty space
            if (panel.getRelativePosition().y + panel.getRelativeSize().height == y){
                // stretch the panel to fill half the empty space vertically
                panel.setRelativeSize(panel.getRelativeSize().width, y+height - panel.getRelativePosition().y);
            }
        });
    } else if (bottomAvalable){
        console.log("bottom available");

        // stretch all panels in the bottom rect to fill the empty space
        let panels_in_rect = get_panels_in_rect(bottom_rect);

        panels_in_rect.forEach((panel) => {
            // if the panel is bordering the empty space
            if (panel.getRelativePosition().y == y + height){
                // stretch the panel to fill the entire empty space vertically
                panel.setRelativeSize(panel.getRelativeSize().width, panel.getRelativeSize().height + height);
                panel.setRelativePosition(panel.getRelativePosition().x, y);
            }
        });
    } else if (leftAvalable && rightAvalable){
        console.log("left and right available");

        //split the space horizontally on all panels that are on the edge
        let panels_in_rect = get_panels_in_rect(left_rect);

        panels_in_rect.forEach((panel) => {
            // if the panel is bordering the empty space
            if (panel.getRelativePosition().x + panel.getRelativeSize().width == x){
                // stretch the panel to fill half the empty space vertically
                panel.setRelativeSize(x+width/2 - panel.getRelativePosition().x, panel.getRelativeSize().height);
            }
        });

        panels_in_rect = get_panels_in_rect(right_rect);

        panels_in_rect.forEach((panel) => {
            // if the panel is bordering the empty space
            if (panel.getRelativePosition().x == x + width){
                // stretch the panel to fill half the empty space vertically
                panel.setRelativeSize(panel.getRelativePosition().x - x, panel.getRelativeSize().height);
                panel.setRelativePosition(x + width/2, panel.getRelativePosition().y);
            }
        });
    }else if (leftAvalable) {
        console.log("left available");

        // stretch all panels in the left rect to fill the empty space
        let panels_in_rect = get_panels_in_rect(left_rect);

        panels_in_rect.forEach((panel) => {
            // if the panel is bordering the empty space
            if (panel.getRelativePosition().x + panel.getRelativeSize().width == x){
                // stretch the panel to fill the entire empty space horizontally
                panel.setRelativeSize(x+width - panel.getRelativePosition().x, panel.getRelativeSize().height);
            }
        });
    } else if (rightAvalable) {
        console.log("right available");

        // stretch all panels in the right rect to fill the empty space
        let panels_in_rect = get_panels_in_rect(right_rect);

        panels_in_rect.forEach((panel) => {
            // if the panel is bordering the empty space
            if (panel.getRelativePosition().x == x + width){
                // stretch the panel to fill the entire empty space vertically
                panel.setRelativeSize(panel.getRelativeSize().width + width, panel.getRelativeSize().height);
                panel.setRelativePosition(x, panel.getRelativePosition().y);
            }
        });
    }

    
    // update all panels
    update_all_panel_positions();
}

function get_panels_in_rect(rect){
    let panels_in_rect = [];

    panels.forEach((panel) => {[]
        let panel_rect = getRelativeRect(panel);

        if (rect_contains_other(rect, panel_rect)){
            panels_in_rect.push(panel);
        }
    });

    return panels_in_rect;
}

function panels_in_rect(rect: Rect){
    let panels_in_rect = get_panels_in_rect(rect);
    if (panels_in_rect.length > 0)
        return true;
    else
        return false;
}

function panels_intersect_rect(rect: Rect) {
    panels.forEach((panel) => {
        let panel_rect = getRelativeRect(panel);

        if (rect_intersects_with_other(rect, panel_rect)) {
            console.log("panels with rect: ", rect, " intersects", panel_rect);
            return true
        }
    });

    return false
}

function display_panel_debug_space_check(rect1: Rect, rect2: Rect, rect3: Rect, rect4: Rect){
    let divs = document.getElementsByClassName("debug-space-check");

    divs[0].setAttribute("style", "left: " + rect1.x*100 + "%; top: " + rect1.y*100 + "%; width: " + rect1.width*100 + "%; height: " + rect1.height*100 + "%;");
    divs[1].setAttribute("style", "left: " + rect2.x*100 + "%; top: " + rect2.y*100 + "%; width: " + rect2.width*100 + "%; height: " + rect2.height*100 + "%;");
    divs[2].setAttribute("style", "left: " + rect3.x*100 + "%; top: " + rect3.y*100 + "%; width: " + rect3.width*100 + "%; height: " + rect3.height*100 + "%;");
    divs[3].setAttribute("style", "left: " + rect4.x*100 + "%; top: " + rect4.y*100 + "%; width: " + rect4.width*100 + "%; height: " + rect4.height*100 + "%;");
}

function getRelativeRect(panel:Panel){
    let panel_position = panel.getRelativePosition();
    let panel_size = panel.getRelativeSize();

    return {
        x: panel_position.x,
        y: panel_position.y,
        width: panel_size.width,
        height: panel_size.height,
    };
}

function rect_contains_other(rect: Rect, other: Rect){
    return (
        rect.x <= other.x &&
        rect.y <= other.y &&
        rect.x + rect.width >= other.x + other.width &&
        rect.y + rect.height >= other.y + other.height
    );
}

function rect_intersects_with_other(rect: Rect, other: Rect){
    return (
        rect.x < other.x + other.width &&
        rect.x + rect.width > other.x &&
        rect.y < other.y + other.height &&
        rect.y + rect.height > other.y
    );
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

    // console.log("displaying panel indicator", x*100, y*100, width*100, height*100);

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
                fill: true,
            };
        }

        // if the mouse is in the lower fifth of the panel, snap to the bottom
        else if (mouseY > panel_position.y + panel_size.height * 4 / 5) {
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
                fill: true,
            };
        }

        // there is a pretend rectangle in the center of the panel of the panel that is the same size as the panel but smaller
        // when the mouse is over this rectangle, snap to the center
        else if (mouseX > panel_position.x + panel_size.width / 5 && mouseX < panel_position.x + panel_size.width * 4 / 5) {

            let draggingPannel = undefined;

            // get dragging panel
            panels.forEach((panel) => {
                if (panel.isDragging()) {
                    draggingPannel = panel;
                    // console.log("dragging panel: " + panel.getName());
                }
            });


            // if there is no dragging panel, skip
            if (draggingPannel == undefined) console.error("no dragging panel! FATAL? WHAT?");

            return {
                position:{
                    x: panel_relative_position.x,
                    y: panel_relative_position.y,
                },
                size:{
                    width: panel_relative_size.width,
                    height: panel_relative_size.height,
                },
                otherPanel: panel,
                otherPanelNewPosition: {x: draggingPannel.getRelativePosition().x, y: draggingPannel.getRelativePosition().y},
                otherPanelNewSize: {width: draggingPannel.getRelativeSize().width, height: draggingPannel.getRelativeSize().height},
                fill: false,
            };
        }
        

        // if the mouse is on the left side of the panel, snap to the left
        else if (mouseX < panel_position.x + panel_size.width / 2) {
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
                fill: true,
            };
        }

        // if the mouse is on the right side of the panel, snap to the right
        else if (mouseX > panel_position.x + panel_size.width / 2) {
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
                fill: true,
            };
        }
    }
    let draggingPannel = undefined;

    // get dragging panel
    panels.forEach((panel) => {
        if (panel.isDragging()) {
            draggingPannel = panel;
            // console.log("dragging panel: " + panel.getName());
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
            fill: false,
        };
    }

    // erorr
    console.error("error getting snap position");
}