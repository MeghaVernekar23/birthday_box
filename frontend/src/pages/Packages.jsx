import React, { useEffect, useState } from "react";
import DataTable from "../components/Datatable";
import { fetchPackage } from "../services/bookingServices";
import "../css/Packages.css";

const Packages = () => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetchPackageData();
  }, []);

  const fetchPackageData = async () => {
    try {
      const data = await fetchPackage();
      setPackages(data);
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      alert("Failed to load package details.");
    }
  };

  const columns = [
    { key: "package_id", label: "ID" },
    { key: "package_name", label: "Package Name" },
    { key: "description", label: "Description" },
    { key: "price", label: "Price" },
  ];

  return (
    <div className="packages-page">
      <DataTable
        title="Packages"
        columns={columns}
        data={packages}
        actions={[]}
        searchableFields={["package_name", "description"]}
      />
    </div>
  );
};

export default Packages;
