import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/Hello";

ReactDOM.hydrate(
    <Hello compiler="TypeScript" framework="React" />,
    document.getElementById("example")
);