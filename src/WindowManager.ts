import type Panel from "./lib/Panel.svelte";

window.addEventListener("resize", update);

let panels = [];

let defaultPanelPositions = [
    {
        name: "workspace",
        left: "20%",
        top: "0%",
        width: "60%",
        height: "80%",
    },
    {
        name: "output",
        left: "20%",
        top: "80%",
        width: "60%",
        height: "20%",
    },
    { name: "toolbox", left: "0%", top: "0%", width: "20%", height: "100%" },
    {
        name: "explorer",
        left: "80%",
        top: "33.333333333333336%",
        width: "20%",
        height: "66.66666666666667%",
    },
    {
        name: "properties",
        left: "80%",
        top: "0%",
        width: "20%",
        height: "33.333333333333336%",
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

        panel.setPosition(percent_to_px(defaultPanelPosition.left, "width"), percent_to_px(defaultPanelPosition.top, "height"));
        panel.setSize(percent_to_px(defaultPanelPosition.width, "width"), percent_to_px(defaultPanelPosition.height, "height"));

        // // debug log values
        // console.log("left: " + percent_to_px(defaultPanelPosition.left, "width"));
        // console.log("top: " + percent_to_px(defaultPanelPosition.top, "height"));
        // console.log("width: " + percent_to_px(defaultPanelPosition.width, "width"));
        // console.log("height: " + percent_to_px(defaultPanelPosition.height, "height"));
    }
}

function update(){
    // recalculate panel positions
    panels.forEach((panel) => {
        setPanelDefaults(panel);
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

function percent_to_px(percent: string, dimension: string) {

    // get bodyDiv bounding box
    let bodyDivBoundingBox = fetchBodyDiv().getBoundingClientRect();

    // strip the percent sign
    let percent_value = parseFloat(percent.slice(0, -1));

    // get the size of the dimension
    if (dimension == "width") var window_dimension = bodyDivBoundingBox.width;
    else if (dimension == "height") var window_dimension = bodyDivBoundingBox.height;

    // calculate the pixel value
    let pixel_value = (percent_value / 100) * window_dimension;

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
