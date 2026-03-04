"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { register } from "./actions";

export default function RegisterForm() {
  const [state, registerAction] = useActionState(register, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-2">Create account</h2>
          <p className="text-gray-600 text-sm">Sign up to get started</p>
        </div>

        <form action={registerAction} className="space-y-5">
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-black mb-2"
            >
              Confirm password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
              placeholder="••••••••"
            />
            {state?.errors?.confirmPassword && (
              <p className="text-gray-700 text-sm mt-1">
                {state.errors.confirmPassword}
              </p>
            )}
          </div>

          <SubmitButton />

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-black font-semibold hover:underline"
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="w-full px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-2"
    >
      {pending ? "Creating account..." : "Create account"}
    </button>
  );
}
