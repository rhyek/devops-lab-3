namespace OrleansService.Models {
  public class TodoRecord : BaseRecord {
    public string Description { get; set; }
    public string OwnerId { get; set; }
    public string AssigneeId { get; set; }
    public bool Completed { get; set; }
  }
}
