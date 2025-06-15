import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterForm from "../RegisterForm";

describe("RegisterForm component", () => {
  it("renders input fields and submit button", () => {
    render(<RegisterForm onRegister={vi.fn()} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i }),
    ).toBeInTheDocument();
  });

  it("calls onRegister with correct data when form is submitted", async () => {
    const mockRegister = vi.fn().mockResolvedValue(undefined);
    render(<RegisterForm onRegister={mockRegister} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.submit(screen.getByRole("form"));

    // Wait for async submission
    await screen.findByText(/registration successful/i);

    expect(mockRegister).toHaveBeenCalledWith({
      fullName: "John Doe",
      email: "john@example.com",
      password: "password123",
    });
  });
});
