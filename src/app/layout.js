import RecaptchaProvider from "@/components/providers/RecaptchaProvider";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RecaptchaProvider>
          {children}
        </RecaptchaProvider>
      </body>
    </html>
  );
}
