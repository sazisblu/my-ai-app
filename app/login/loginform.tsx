"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "./actions";

export default function LoginForm() {
  const [state, loginAction] = useActionState(login, undefined);
  //  this is the mordern way of hanlding form submissions.
  // useActionState is a mordern react hook that will take a form action and a initial state and it will assign it to form state var and for action wrappper which should be passed to the action prop of the form element.
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-2">Sign in</h2>
          <p className="text-gray-600 text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        <form action={loginAction} className="space-y-5">
          {/* loginAction is the wrapper for the login form action */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-black mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
              placeholder="name@example.com"
            />
            {state?.errors?.email && (
              <p className="text-gray-700 text-sm mt-1">{state.errors.email}</p>
            )}
            {/* this is called optional chaining which will check for the next element only if the previous exists. this prevents long if statements*/}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-black mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
              placeholder="••••••••"
            />
            {state?.errors?.password && (
              <p className="text-gray-700 text-sm mt-1">
                {state.errors.password}
              </p>
            )}
          </div>

          <SubmitButton />
          <p className="text-black">
            Dont have an account?{" "}
            <a href="/register" className="text-blue-400">
              register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  //   note pending var is a boolean which will be true when the form is currently being submitted
  // pending will be false otherwise
  return (
    <button
      disabled={pending}
      type="submit"
      className="w-full px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-2"
    >
      {/* by cleverly using hte pending boolean we can disable the submit button when the form submission is happening currently */}
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}
