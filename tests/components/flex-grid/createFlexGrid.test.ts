import { describe, expect, it } from "bun:test";
import { createRoot, createSignal, flush } from "solid-js";
import { createFlexGrid } from "../../../src/components/flex-grid/createFlexGrid";

const rows = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

/** A scroll event whose `currentTarget` reports the given geometry. */
function scrollEvent(geometry: {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}): Event {
  return { currentTarget: geometry } as unknown as Event;
}

describe("createFlexGrid", () => {
  it("builds one page up front, however long the list is", () => {
    createRoot((dispose) => {
      const grid = createFlexGrid({ rows: () => rows(700), pageSize: 20 });
      expect(grid.visible().length).toBe(20);
      expect(grid.total()).toBe(700);
      expect(grid.remaining()).toBe(680);
      expect(grid.hasMore()).toBe(true);
      dispose();
    });
  });

  it("reveals a page at a time, and stops at the end", () => {
    createRoot((dispose) => {
      const grid = createFlexGrid({ rows: () => rows(25), pageSize: 20 });
      expect(grid.nextCount(), "the last page is short, not a full page").toBe(5);

      grid.revealMore();
      flush();
      expect(grid.visible().length).toBe(25);
      expect(grid.hasMore()).toBe(false);

      // Past the end is a no-op rather than an overflowing limit.
      grid.revealMore();
      flush();
      expect(grid.visible().length).toBe(25);
      dispose();
    });
  });

  it("never reveals more rows than exist", () => {
    createRoot((dispose) => {
      const grid = createFlexGrid({ rows: () => rows(3), pageSize: 20 });
      expect(grid.visible().length).toBe(3);
      expect(grid.hasMore()).toBe(false);
      expect(grid.nextCount()).toBe(0);
      dispose();
    });
  });

  /*
   * A log or a transcript is read newest-first, so its first page is the tail
   * and "more" means earlier. Revealing must extend backwards: the rows already
   * on screen keep their place, and the new ones appear above them.
   */
  it("takes the first page from the end when asked, and grows backwards", () => {
    createRoot((dispose) => {
      const grid = createFlexGrid({ rows: () => rows(10), pageSize: 4, fromEnd: true });
      expect(grid.visible()).toEqual([6, 7, 8, 9]);

      grid.revealMore();
      flush();
      expect(grid.visible()).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
      dispose();
    });
  });

  it("follows the rows when they change", () => {
    createRoot((dispose) => {
      const [source, setSource] = createSignal(rows(5));
      const grid = createFlexGrid({ rows: source, pageSize: 20 });
      expect(grid.visible().length).toBe(5);

      setSource(rows(40));
      flush();
      expect(grid.visible().length, "the page size still caps a longer list").toBe(20);
      expect(grid.remaining()).toBe(20);
      dispose();
    });
  });

  it("reveals everything, and resets back to one page", () => {
    createRoot((dispose) => {
      const grid = createFlexGrid({ rows: () => rows(100), pageSize: 20 });
      grid.revealAll();
      flush();
      expect(grid.visible().length).toBe(100);
      expect(grid.hasMore()).toBe(false);

      grid.reset();
      flush();
      expect(grid.visible().length).toBe(20);
      dispose();
    });
  });

  /*
   * Scroll, not `IntersectionObserver`. Consumers of this library do not all run
   * in an engine that has observers - one renders through Blitz, where a
   * sentinel would never intersect and the list would silently stop at its first
   * page. These assert the arithmetic that replaces it.
   */
  describe("onScroll", () => {
    it("reveals when the scroller nears the bottom", () => {
      createRoot((dispose) => {
        const grid = createFlexGrid({ rows: () => rows(100), pageSize: 20 });

        grid.onScroll(scrollEvent({ scrollTop: 0, scrollHeight: 2000, clientHeight: 400 }));
        expect(grid.visible().length, "the top of a long list is not the end").toBe(20);

        grid.onScroll(scrollEvent({ scrollTop: 1550, scrollHeight: 2000, clientHeight: 400 }));
        flush();
        expect(grid.visible().length).toBe(40);
        dispose();
      });
    });

    it("reveals at the top when the list runs from the end", () => {
      createRoot((dispose) => {
        const grid = createFlexGrid({ rows: () => rows(100), pageSize: 20, fromEnd: true });

        grid.onScroll(scrollEvent({ scrollTop: 900, scrollHeight: 2000, clientHeight: 400 }));
        expect(grid.visible().length, "the middle is not the top").toBe(20);

        grid.onScroll(scrollEvent({ scrollTop: 10, scrollHeight: 2000, clientHeight: 400 }));
        flush();
        expect(grid.visible().length).toBe(40);
        dispose();
      });
    });

    it("does nothing once everything is visible", () => {
      createRoot((dispose) => {
        const grid = createFlexGrid({ rows: () => rows(10), pageSize: 20 });
        grid.onScroll(scrollEvent({ scrollTop: 1600, scrollHeight: 2000, clientHeight: 400 }));
        expect(grid.visible().length).toBe(10);
        dispose();
      });
    });
  });
});
