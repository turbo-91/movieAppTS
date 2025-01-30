import { render, screen } from "@testing-library/react";
import Home from "../src/pages/index";

describe("Home Page", () => {
  it("renders the home page correctly", () => {
    render(<Home />);
    const logo = screen.getByAltText("Next.js logo");
    expect(logo).toBeInTheDocument();
  });
});
