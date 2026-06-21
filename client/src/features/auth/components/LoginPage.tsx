import clsx from "clsx";
import styles from "./LoginPage.module.css";
import { useLogin } from "../hooks/useLogin";
import { useState } from "react";
import {
  Button,
  Form,
  FormControl,
  Input,
  Label,
} from "@/components/form/Form";
import { Card } from "@/components/card/Card";

export const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { error, onLogin } = useLogin({ email, password });

  return (
    <div className={clsx(styles.root)}>
      <div className={clsx(styles.formWrapper)}>
        <div>
          <h1 className={clsx(styles.heading)}>Welcome back</h1>
          <p className={clsx(styles.subheading)}>Sign in to your account</p>
        </div>
        {error && <p>{error.message}</p>}
        <Card>
          <Form onSubmit={onLogin}>
            <FormControl>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </FormControl>
            <FormControl>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </FormControl>
            <Button type="submit">Sign in</Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};
