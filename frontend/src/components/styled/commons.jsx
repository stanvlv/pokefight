import { styled } from "@mui/material/styles";

export const CSSGrid = styled("div")(({theme, colTemplate}) => ({
    display: "grid",
    gridTemplateColumns: colTemplate ?? `fit-content(30%) 1fr`,
    [theme.breakpoints.down("sm")]: {
        gridTemplateColumns: `1fr`,
    },
    alignItems: "stretch",
    gridTemplateRows: "minmax(10em, 1fr)",
})
)
