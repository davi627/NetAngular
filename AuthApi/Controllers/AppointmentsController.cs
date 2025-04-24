using Microsoft.AspNetCore.Mvc;
using AuthApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AuthApi.Controllers{
[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AppointmentsController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateAppointment([FromBody] AppointmentDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        var appointment = new Appointment
        {
            Date = dto.Date,
            Time = dto.Time,
            DoctorName = dto.DoctorName,
            Department = dto.Department,
            Reason= dto.Reason,
            UserId = userId
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Appointment booked successfully", appointment });
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAppointments()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        var appointments = await _context.Appointments
            .Where(a => a.UserId == userId)
            .ToListAsync();

        return Ok(appointments);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (appointment == null)
        {
            return NotFound("Appointment not found.");
        }

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Appointment cancelled." });
    }
}

};