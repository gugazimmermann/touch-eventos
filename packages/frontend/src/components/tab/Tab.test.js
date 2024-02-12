import { render, fireEvent, screen } from "@testing-library/react";
import Tab from "./Tab";

describe("Tab component", () => {
  const tabs = [
    { title: "Tab 1", compoment: <div>Content for Tab 1</div> },
    { title: "Tab 2", compoment: <div>Content for Tab 2</div> },
    { title: "Tab 3", compoment: <div>Content for Tab 3</div> },
  ];

  test("renders tabs and handles tab click correctly", () => {
    const onTabClick = jest.fn();
    render(<Tab tabs={tabs} selectedTab={0} onTabClick={onTabClick} />);

    tabs.forEach((tab, i) => {
      const tabButton = screen.getByText(tab.title);
      fireEvent.click(tabButton);
      expect(onTabClick).toHaveBeenCalledWith(i);
    });
  });

  const sizes = [
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "4xl",
    "5xl",
    "6xl",
    "7xl",
    "full",
  ];
  sizes.forEach((size) => {
    test("renders tabs with different sizes correctly", () => {
      render(
        <Tab tabs={tabs} selectedTab={0} size={size} onTabClick={() => {}} />
      );
      const container = screen.getByTestId("tab-container");
      expect(container).toHaveClass(`max-w-${size}`);
    });
  });

  test("renders tabs and handles loading state correctly", () => {
    render(
      <Tab loading={true} tabs={tabs} selectedTab={0} onTabClick={() => {}} />
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Content for Tab 1")).toBeNull();
  });

  test("renders tabs and handles missing content correctly", () => {
    const emptyTabs = [
      { title: "Tab 1", compoment: null },
      { title: "Tab 2", compoment: undefined },
      { title: "Tab 3" },
    ];

    render(<Tab tabs={emptyTabs} selectedTab={0} onTabClick={() => {}} />);
    emptyTabs.forEach((tab) => {
      expect(screen.getByText(tab.title)).toBeInTheDocument();
    });
    expect(screen.queryByText("Content for Tab 1")).toBeNull();
  });
});
