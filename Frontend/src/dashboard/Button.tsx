import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";

interface InputField {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

interface ButtonComponentProps {
  heading: string;
  response: string | null;
  url: string;
  endpoint: string;
  buttonId: string;
  inputFields?: InputField[];
  onServerClick: (url: string, endpoint: string, setLoadingState: (loading: boolean) => void, buttonId: string) => Promise<void>;
  setLoadingState: (loading: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  heading,
  response,
  url,
  endpoint,
  buttonId,
  inputFields,
  onServerClick,
  setLoadingState,
  loading = false,
  disabled = false,
}) => {
  const handleClick = () => {
    onServerClick(url, endpoint, setLoadingState, buttonId);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "100%" }}>
      {inputFields && inputFields.map((inputField, index) => (
        <TextField
          key={index}
          label={inputField.label}
          variant="outlined"
          value={inputField.value}
          onChange={(e) => inputField.onChange(e.target.value)}
          sx={{ width: 300 }}
        />
      ))}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, width: "100%", justifyContent: "center" }}>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<AssignmentIcon />}
          onClick={handleClick}
          sx={{
            borderRadius: 8,
            fontWeight: 700,
            px: 4,
            py: 1.5,
            boxShadow: 4,
            textTransform: "none",
            fontSize: 20,
            background: "linear-gradient(90deg, #7b1fa2 0%, #512da8 100%)",
            ":hover": {
              background: "linear-gradient(90deg, #512da8 0%, #7b1fa2 100%)",
            },
          }}
          disabled={disabled || loading}
        >
          {heading}
        </Button>
        <Typography variant="h6" sx={{ color: "#7b1fa2", fontWeight: 600, minWidth: 200 }}>
          {response ? `${response}` : "Not fetched"}
        </Typography>
      </Box>
    </Box>
  );
};

export default ButtonComponent;
