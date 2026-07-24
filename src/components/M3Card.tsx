import { Paper, Typography, type PaperProps, type SxProps, type Theme } from "@mui/material";

interface M3CardProps extends Omit<PaperProps, "title"> {
  title?: string;
}

export default function M3Card({ title, children, sx, ...rest }: M3CardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: "28px",
        boxShadow: "0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px 1px rgba(0,0,0,0.08)",
        ...sx,
      } as SxProps<Theme>}
      {...rest}
    >
      {title && (
        <Typography
          variant="caption"
          sx={{
            mb: 2,
            display: "block",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
}
