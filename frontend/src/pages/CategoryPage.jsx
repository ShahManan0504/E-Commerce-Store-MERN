import React, { Fragment, useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";

const CategoryPage = () => {
  const { products, fetchProductsByCategory } = useProductStore();
  const { category } = useParams();

  useEffect(() => {
    fetchProductsByCategory(category);
  }, [fetchProductsByCategory, category]);

  return (
    <Fragment>
      <div>CategoryPage</div>
    </Fragment>
  );
};

export default CategoryPage;
