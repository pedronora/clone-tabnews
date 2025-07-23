import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = isLoading
    ? "Carregando..."
    : new Date(data.updated_at).toLocaleString("pt-BR");

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let databaseStatusInformation = "Carregando...";

  if (!isLoading && data) {
    const databaseVersion = data.dependencies.database.version;
    const databaseName = data.dependencies.database.db_name;
    const openedConnections = data.dependencies.database.opened_connections;
    const maxConnections = data.dependencies.database.max_connections;

    databaseStatusInformation = (
      <>
        <div>Database Name: {databaseName}</div>
        <div>Database Version: {databaseVersion}</div>
        <div>Max Connections: {maxConnections}</div>
        <div>Opened Connectios: {openedConnections}</div>
      </>
    );
  }

  return (
    <>
      <h2>Database:</h2>
      {databaseStatusInformation}
    </>
  );
}
