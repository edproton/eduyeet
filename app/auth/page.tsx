"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Rocket, Sun } from "lucide-react";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import Image from "next/image";

export default function AuthPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:flex-1 lg:relative bg-gradient-to-br from-primary to-secondary">
        <Image
          src="/learning.png"
          alt="EduYeet Platform"
          width={1920}
          height={1080}
          className="object-cover w-full h-64 lg:h-full opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-6xl font-bold mb-4 animate-bounce">EduYeet</h1>
          <p className="text-xl">Launch Your Learning Journey!</p>
        </div>
      </div>
      <div className="lg:flex-1 w-full max-w-md mx-auto p-6 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full"
        >
          <Card className="w-full">
            <CardHeader className="relative">
              <div className="absolute top-0 right-0 p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  aria-label={`Switch to ${
                    theme === "light" ? "dark" : "light"
                  } mode`}
                >
                  {theme === "light" ? (
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                  ) : (
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                  )}
                </Button>
              </div>
              <CardTitle className="animate-pulse text-3xl text-center font-extrabold flex items-center justify-center mt-6">
                Join Us <Rocket className="inline-block ml-2" />
              </CardTitle>
              <CardDescription className="text-center">
                Sign up or log in to start yeeting knowledge!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 ease-in-out"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 ease-in-out"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
                <div className="mt-4">
                  <TabsContent value="login">
                    <LoginForm />
                  </TabsContent>
                  <TabsContent value="register">
                    <RegisterForm />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground">
              By using EduYeet, you agree to our Terms of Service and Privacy
              Policy.
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
