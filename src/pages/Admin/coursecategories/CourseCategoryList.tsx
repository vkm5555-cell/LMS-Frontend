import React from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import CourseCategoryTable from "../../../components/tables/Course/CourseCategoryTable";
import PageMeta from "../../../components/common/PageMeta";




const CourseCategoryList: React.FC = () => {

  return (
    <>
      <PageMeta title="BBDU LMS | List Course Category" description="BBDU LMS - List Course Category" />
      <PageBreadcrumb pageTitle="Course Category List" />
      <div className="space-y-6">
        <ComponentCard title="Course Categories">
          <CourseCategoryTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default CourseCategoryList;
