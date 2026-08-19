import { describe, expect, it } from "bun:test";
import { createRoot } from "solid-js";
import { createDataGrid } from "../../../src/components/data-grid/createDataGrid";

type Person = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  color: string;
};

const people: Person[] = [
  { id: 1, firstName: "John", lastName: "Doe", age: 41, color: "Blue" },
  { id: 2, firstName: "Jane", lastName: "Roe", age: 29, color: "Red" },
  { id: 3, firstName: "Ada", lastName: "Byron", age: 36, color: "Blue" },
  { id: 4, firstName: "Grace", lastName: "Hopper", age: 45, color: "Green" },
];

const build = (options: Parameters<typeof createDataGrid<Person>>[0] = {}) => {
  const grid = createDataGrid<Person>(options);
  grid.addColumn("id", "ID", "number");
  grid.addColumn("firstName", "First Name", "string", { searchable: true });
  grid.addColumn("lastName", "Last Name", "string", { searchable: true });
  grid.addColumn("age", "Age", "number");
  grid.addColumn("color", "Color", "custom");
  for (const person of people) grid.addRow(person);
  return grid;
};

describe("createDataGrid: the builder", () => {
  it("takes dataType third positionally, so an addColumn call ports across", () => {
    createRoot((dispose) => {
      const grid = build();
      expect(grid.columns().map((column) => column.name)).toEqual([
        "id",
        "firstName",
        "lastName",
        "age",
        "color",
      ]);
      expect(grid.columnsByName().age.dataType).toBe("number");
      expect(grid.columnsByName().color.dataType).toBe("custom");
      dispose();
    });
  });

  it("works with no options at all, and renders every row", () => {
    createRoot((dispose) => {
      const grid = build();
      expect(grid.pageRows()).toHaveLength(4);
      expect(grid.total()).toBe(4);
      expect(grid.pageCount()).toBe(1);
      dispose();
    });
  });

  it("inserts at an index when given one, and appends when not", () => {
    createRoot((dispose) => {
      const grid = build();
      grid.addRow(
        { id: 5, firstName: "Alan", lastName: "Turing", age: 41, color: "Red" },
        0,
      );
      expect(grid.rows()[0].firstName).toBe("Alan");
      grid.deleteRow(0);
      expect(grid.rows()[0].firstName).toBe("John");
      dispose();
    });
  });
});

describe("createDataGrid: sorting", () => {
  it("cycles ascending, descending, then back to unsorted", () => {
    createRoot((dispose) => {
      const grid = build();
      grid.sortByColumn("age");
      expect(grid.sort()).toEqual({ column: "age", direction: "ascending" });
      expect(grid.pageRows().map((row) => row.age)).toEqual([29, 36, 41, 45]);

      grid.sortByColumn("age");
      expect(grid.pageRows().map((row) => row.age)).toEqual([45, 41, 36, 29]);

      grid.sortByColumn("age");
      expect(grid.sort()).toBeNull();
      expect(grid.pageRows().map((row) => row.age)).toEqual([41, 29, 36, 45]);
      dispose();
    });
  });

  it("orders strings by locale and numbers numerically", () => {
    createRoot((dispose) => {
      const grid = build();
      grid.sortByColumn("firstName", "ascending");
      expect(grid.pageRows().map((row) => row.firstName)).toEqual([
        "Ada",
        "Grace",
        "Jane",
        "John",
      ]);
      dispose();
    });
  });

  it("does not mutate the source rows", () => {
    createRoot((dispose) => {
      const grid = build();
      grid.sortByColumn("age", "descending");
      expect(grid.rows().map((row) => row.id)).toEqual([1, 2, 3, 4]);
      dispose();
    });
  });

  it("takes a per-column compare over the dataType's ordering", () => {
    createRoot((dispose) => {
      const grid = createDataGrid<Person>();
      grid.addColumn("color", "Color", "custom", {
        compare: (a, b) => String(b).localeCompare(String(a)),
      });
      for (const person of people) grid.addRow(person);
      grid.sortByColumn("color", "ascending");
      expect(grid.pageRows().map((row) => row.color)).toEqual([
        "Red",
        "Green",
        "Blue",
        "Blue",
      ]);
      dispose();
    });
  });
});

describe("createDataGrid: searching", () => {
  it("accumulates across columns, which vue3 could not do", () => {
    createRoot((dispose) => {
      const grid = build();
      grid.searchColumn("firstName", "j");
      expect(grid.pageRows().map((row) => row.firstName)).toEqual([
        "John",
        "Jane",
      ]);

      grid.searchColumn("lastName", "roe");
      expect(grid.pageRows().map((row) => row.firstName)).toEqual(["Jane"]);

      grid.resetFilters();
      expect(grid.pageRows()).toHaveLength(4);
      dispose();
    });
  });

  it("survives a page change, which is the bug this model exists to fix", () => {
    createRoot((dispose) => {
      const grid = build({ pageSize: 1 });
      grid.searchColumn("color", "blue");
      expect(grid.total()).toBe(2);
      expect(grid.pageCount()).toBe(2);

      grid.switchPage(1);
      expect(grid.total()).toBe(2);
      expect(grid.pageRows().map((row) => row.firstName)).toEqual(["Ada"]);
      dispose();
    });
  });

  it("composes with sorting rather than replacing it", () => {
    createRoot((dispose) => {
      const grid = build();
      grid.sortByColumn("age", "descending");
      grid.searchColumn("color", "blue");
      expect(grid.pageRows().map((row) => row.age)).toEqual([41, 36]);
      dispose();
    });
  });

  it("returns to page one when the result set changes under the reader", () => {
    createRoot((dispose) => {
      const grid = build({ pageSize: 2 });
      grid.switchPage(1);
      expect(grid.page()).toBe(1);
      grid.searchColumn("firstName", "a");
      expect(grid.page()).toBe(0);
      dispose();
    });
  });
});

describe("createDataGrid: pagination", () => {
  it("is off unless a pageSize was given", () => {
    createRoot((dispose) => {
      const grid = build();
      expect(grid.pageSize()).toBe(0);
      expect(grid.pageCount()).toBe(1);
      expect(grid.pageRows()).toHaveLength(4);
      dispose();
    });
  });

  it("clamps a page request to the pages that exist", () => {
    createRoot((dispose) => {
      const grid = build({ pageSize: 2 });
      grid.switchPage(99);
      expect(grid.page()).toBe(1);
      grid.switchPage(-5);
      expect(grid.page()).toBe(0);
      dispose();
    });
  });
});

describe("createDataGrid: column visibility", () => {
  it("hides a column without removing it", () => {
    createRoot((dispose) => {
      const grid = build();
      grid.toggleColumn("color");
      expect(grid.columns()).toHaveLength(5);
      expect(grid.visibleColumns().map((column) => column.name)).not.toContain(
        "color",
      );
      grid.toggleColumn("color", true);
      expect(grid.visibleColumns()).toHaveLength(5);
      dispose();
    });
  });
});

describe("createDataGrid: selection", () => {
  it("keeps a selection attached to its row across a sort", () => {
    createRoot((dispose) => {
      const grid = build({ selection: "multiple" });
      const jane = grid.rows()[1];
      grid.toggleCheck(jane, 1);
      expect(grid.selectedRows().map((row) => row.firstName)).toEqual(["Jane"]);

      grid.sortByColumn("age", "descending");
      expect(grid.selectedRows().map((row) => row.firstName)).toEqual(["Jane"]);
      dispose();
    });
  });

  it("holds one row at a time in single mode", () => {
    createRoot((dispose) => {
      const grid = build({ selection: "single" });
      grid.toggleCheck(grid.rows()[0], 0);
      grid.toggleCheck(grid.rows()[1], 1);
      expect(grid.selectedRows().map((row) => row.id)).toEqual([2]);
      dispose();
    });
  });

  it("selects what the reader can see, not what a filter is hiding", () => {
    createRoot((dispose) => {
      const grid = build({ selection: "multiple" });
      grid.searchColumn("color", "blue");
      grid.toggleCheckAll(true);
      expect(grid.selectedRows().map((row) => row.color)).toEqual([
        "Blue",
        "Blue",
      ]);
      grid.toggleCheckAll(false);
      expect(grid.selectedRows()).toHaveLength(0);
      dispose();
    });
  });
});

describe("createDataGrid: grouping", () => {
  it("returns distinct values in first-seen order", () => {
    createRoot((dispose) => {
      const grid = build();
      expect(grid.groups("color")).toEqual(["Blue", "Red", "Green"]);
      dispose();
    });
  });

  it("buckets the rendered rows once a groupBy is set", () => {
    createRoot((dispose) => {
      const grid = build({ groupBy: "color" });
      expect(
        grid.groupedRows().map((group) => [group.value, group.rows.length]),
      ).toEqual([
        ["Blue", 2],
        ["Red", 1],
        ["Green", 1],
      ]);
      dispose();
    });
  });

  it("is a single unnamed bucket when no groupBy is set", () => {
    createRoot((dispose) => {
      const grid = build();
      expect(grid.groupedRows()).toHaveLength(1);
      expect(grid.groupedRows()[0].rows).toHaveLength(4);
      dispose();
    });
  });

  it("filterRows narrows to one value, as vue3's did", () => {
    createRoot((dispose) => {
      const grid = build();
      expect(grid.filterRows("color", "Blue").map((row) => row.id)).toEqual([
        1, 3,
      ]);
      dispose();
    });
  });
});
