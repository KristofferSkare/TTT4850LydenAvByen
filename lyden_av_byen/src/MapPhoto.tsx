import React from "react";
//import * as trondheim from "./trondheim.png";
const trondheim = require("./trondheim.png");
export default function MapPhoto(): JSX.Element {
    

    

    return(
        <>
        <img src={String(trondheim)} alt="" />
        </>

    )
}