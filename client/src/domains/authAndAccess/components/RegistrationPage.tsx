import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const RegistrationPage = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={() => {}}>
              <FieldGroup>
                <Field orientation="responsive">
                  <Field>
                    <FieldLabel htmlFor="firstName">First name</FieldLabel>
                    <Input id="firstName" type="text" placeholder="Jane" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                    <Input id="lastName" type="text" placeholder="Doe" required />
                  </Field>
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" type="password" required />
                  <FieldDescription>
                    At least 8 characters, with an uppercase letter, lowercase
                    letter, number, and symbol.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm password
                  </FieldLabel>
                  <Input id="confirmPassword" type="password" required />
                </Field>
                <Field>
                  <Button type="submit">Create Account</Button>
                  <FieldDescription className="text-center">
                    Already have an account? <Link to="/login">Sign in</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
