import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Fab,
  Avatar,
  Tooltip,
  Button
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import AssignmentIcon from "@mui/icons-material/Assignment";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<null | { paragraph: string, sentences: { length: number, score: number, text: string }[] }>(null);
  const navigate = useNavigate();

  const handleGetAssignments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/getPandS", {
        withCredentials: true,
      });
      setAssignment(res.data); // expects { paragraph, sentences: [{ length, score, text }] }
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Classroom
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{
              mr: 2,
              borderRadius: 6,
              fontWeight: 700,
              px: 3,
              py: 1,
              fontSize: 18,
              background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
              boxShadow: 3,
              transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
              ':hover': {
                transform: 'scale(1.08)',
                boxShadow: 8,
                background: "linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)"
              }
            }}
            onClick={() => {navigate("/login")}}
          >
            Login
          </Button>
          <Tooltip title="Account">
            <IconButton color="inherit">
              <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AssignmentIcon />}
            onClick={handleGetAssignments}
            sx={{
              borderRadius: 8,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              boxShadow: 4,
              textTransform: "none",
              fontSize: 20,
              background: "linear-gradient(90deg, #7b1fa2 0%, #512da8 100%)",
              ':hover': { background: "linear-gradient(90deg, #512da8 0%, #7b1fa2 100%)" }
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Assignments"}
          </Button>
        </Box>
        {assignment && (
          <Box sx={{
            mt: 4,
            p: 3,
            borderRadius: 4,
            background: '#fff',
            boxShadow: 2,
            maxWidth: 800,
            mx: 'auto',
          }}>
            <style>{`
              .sentence-animate {
                position: relative;
                display: inline-block;
                border-radius: 6px;
                padding: 2px 8px;
                margin: 0 4px 8px 0;
                font-weight: 500;
                color: #fff;
                overflow: hidden;
              }
              .sentence-animate::before {
                content: '';
                position: absolute;
                left: 0; top: 0; bottom: 0;
                width: 0%;
                background: var(--score-color, #d32f2f);
                z-index: 0;
                border-radius: 6px;
                animation: redSweep 1s forwards;
              }
              .sentence-animate .sentence-text {
                position: relative;
                z-index: 1;
              }
              @keyframes redSweep {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Assignment Analysis</Typography>
            <Box>
              {assignment.sentences.map((s, i) => {
                let color = '#d32f2f';
                if (s.score >= 80) color = '#2e7d32'; // deep green
                else if (s.score >= 60) color = '#388e3c'; // green
                else if (s.score >= 40) color = '#fbc02d'; // yellow
                else if (s.score >= 20) color = '#f57c00'; // orange
                // else stays red
                return (
                  <span
                    key={i}
                    className="sentence-animate"
                    style={{ animationDelay: `${i * 0.1}s`, '--score-color': color } as React.CSSProperties}
                    title={`Score: ${s.score.toFixed(2)}`}
                  >
                    <span className="sentence-text">{s.text}</span>
                  </span>
                );
              })}
            </Box>
          </Box>
        )}
        <Fab color="primary" aria-label="add" sx={{ position: "fixed", bottom: 32, right: 32, boxShadow: 6 }}>
          <AddIcon />
        </Fab>
      </Box>
    </Box>
  );
};

export default Dashboard;