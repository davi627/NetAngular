using AuthApi.Models;
public class Appointment
{
    public int Id { get; set; }
    public string Date { get; set; }
    public string Time { get; set; }
    public string DoctorName { get; set; }
    public string Department { get; set; }
    public string Reason { get; set; }
    public string Status { get; set; } = "Pending";
    public int UserId { get; set; }
    public DateTime? ProposedNewDate { get; set; }
    public string? ProposedNewTime { get; set; }
    public string? CancellationNote { get; set; }


    // Navigation property
    public User User { get; set; }
}
