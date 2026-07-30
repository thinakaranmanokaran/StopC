import { Paper, Typography, useTheme, type PaperProps, type SxProps, type Theme } from "@mui/material";
import { cardShadow } from "@/utils/elevation";

interface M3CardProps extends Omit<PaperProps, "title"> {
  title?: string;
}

export default function M3Card({ title, children, sx, ...rest }: M3CardProps) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: "28px",
        boxShadow: cardShadow(theme),
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
