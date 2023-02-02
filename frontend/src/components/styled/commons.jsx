import { styled } from "@mui/material";

// styled() div element that creates grid with 2 columns
export const CSSGrid = styled("div")({
    display: "grid",
    gridTemplateColumns: "fit-content(30%) 1fr",
    alignItems: "stretch",
})