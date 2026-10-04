"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSignIn } from "@/hooks/use-session";

export function SessionGate() {
  const signIn = useSignIn();
  const [email, setEmail] = useState("");

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle>Enter Building Permit AI</CardTitle>
          <CardDescription>
            Mock auth for local development. Enter any email to open the
            dashboard scoped to that address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              signIn.mutate(email);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {signIn.isError ? (
              <p className="text-sm text-destructive" role="alert">
                {signIn.error.message}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={signIn.isPending}
            >
              {signIn.isPending ? "Entering..." : "Open dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
