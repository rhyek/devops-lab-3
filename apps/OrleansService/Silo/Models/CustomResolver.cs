using System;
using System.Reflection;
using Dapper;
using OrleansService.Extensions;

namespace OrleansService.Models {
  public class CustomResolver : SimpleCRUD.ITableNameResolver, SimpleCRUD.IColumnNameResolver {
    public string ResolveTableName(Type type) {
      return $"{type.Name.Split("Record")[0]}s";
    }

    public string ResolveColumnName(PropertyInfo propertyInfo) {
      return propertyInfo.Name.ToUnderscoreCase();
    }
  }
}
