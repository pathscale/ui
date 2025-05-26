import Table from "./Table";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const users: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "Editor" },
];

const basicColumns: { key: keyof User; header: string }[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
];

const sortableColumns: {
  key: keyof User;
  header: string;
  sortable: boolean;
}[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email", sortable: true },
  { key: "role", header: "Role", sortable: true },
];

const TableShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic Usage</h2>
        <div class="overflow-auto">
          <Table columns={basicColumns} rows={users} rowKey={(row) => row.id} />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Sortable Columns
        </h2>
        <div class="overflow-auto">
          <Table
            columns={sortableColumns}
            rows={users}
            rowKey={(row) => row.id}
            onSort={(key, direction) =>
              console.log(`Sorting by ${String(key)} ${direction}`)
            }
          />
        </div>
      </section>
    </div>
  );
};

export default TableShowcase;
