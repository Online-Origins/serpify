"use client";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import PageTitle from "@/components/page-title/page-title.component";
import Button from "@/components/ui/button/button.component";
import { useRouter } from "next/navigation";

export default function LogIn() {
  const router = useRouter();
  async function handleAuthorize() {
    try {
      const response = await fetch("/api/authorizeSearchConsole", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const authUrl = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.log("Error while authorizing", error);
    }
  }

  return (
    <InnerWrapper>
      <PageTitle title={"Log in"} />
      <Button type={"solid"} onClick={() => handleAuthorize()}>
        <p>Log in with Google</p>
      </Button>
      <Button type={"outline"} onClick={() => {sessionStorage.setItem("role", "guest"); router.push("/")}}>
        <p>Go further as guest</p>
      </Button>
    </InnerWrapper>
  );
}
