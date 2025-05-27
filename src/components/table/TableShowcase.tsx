import { type Component } from "solid-js";
import { Table } from "../../";

const TableShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      {/* Default Table */}
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Default Table
        </h2>
        <div class="overflow-x-auto">
          <Table>
            <Table.Head>
              <span>#</span>
              <span>Name</span>
              <span>Role</span>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <span>1</span>
                <span>Alice</span>
                <span>Engineer</span>
              </Table.Row>
              <Table.Row>
                <span>2</span>
                <span>Bob</span>
                <span>Designer</span>
              </Table.Row>
              <Table.Row>
                <span>3</span>
                <span>Carol</span>
                <span>Product</span>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </section>

      {/* Zebra-Striped Table */}
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Zebra-Striped Table
        </h2>
        <div class="overflow-x-auto">
          <Table zebra>
            <Table.Head>
              <span>#</span>
              <span>Name</span>
              <span>Role</span>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <span>1</span>
                <span>Alice</span>
                <span>Engineer</span>
              </Table.Row>
              <Table.Row>
                <span>2</span>
                <span>Bob</span>
                <span>Designer</span>
              </Table.Row>
              <Table.Row>
                <span>3</span>
                <span>Carol</span>
                <span>Product</span>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default TableShowcase;
