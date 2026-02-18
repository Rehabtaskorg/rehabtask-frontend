import RecaptchaProvider from "@/components/providers/RecaptchaProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <RecaptchaProvider>
            {children}
          </RecaptchaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
