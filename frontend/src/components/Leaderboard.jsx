import { useState, useEffect } from "react";
import axios from "axios";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";

import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/leaderboard")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  console.log(users);

  return (
    <>
      <h1>Let me present you the best Poke Trainers/Fighters</h1>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">Place</StyledTableCell>
              <StyledTableCell align="left">Player name</StyledTableCell>
              <StyledTableCell align="right">Games played</StyledTableCell>
              <StyledTableCell align="right">Games won</StyledTableCell>
              <StyledTableCell align="right">Games lost</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <StyledTableRow key={user._id}>
                <StyledTableCell component="th" scope="row">
                  0-10
                </StyledTableCell>
                <StyledTableCell align="left">{user.nickname}</StyledTableCell>
                <StyledTableCell align="right">
                  {user.games_played}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {user.games_won}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {user.games_lost}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
