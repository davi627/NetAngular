using Microsoft.AspNetCore.Mvc;
using AuthApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AuthApi.Controllers
{
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
                Reason = dto.Reason,
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
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;

            if (userRole == "Doctor")
{
    var doctorAppointments = await _context.Appointments
        .Where(a => a.DoctorName.ToLower() == userName.ToLower())
        .Include(a => a.User) 
        .Select(a => new
        {
            a.Id,
            a.Date,
            a.Time,
            a.DoctorName,
            a.Department,
            a.Reason,
            a.Status,
            PatientUsername = a.User.Username 
        })
        .ToListAsync();

    return Ok(doctorAppointments);
}

            else
            {
                var appointments = await _context.Appointments
                    .Where(a => a.UserId == userId)
                    .ToListAsync();

                return Ok(appointments);
            }
        }

        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctors()
        {
            var doctors = await _context.Users
                .Where(u => u.Role == "Doctor")
                .Select(u => new { u.Id, u.Username })
                .ToListAsync();

            return Ok(doctors);
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

        // ✅ NEW: PATCH endpoint to update appointment status
        [HttpPatch("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] StatusUpdateDto statusDto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound("Appointment not found.");
            }

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var doctorName = User.FindFirst(ClaimTypes.Name)?.Value;

            if (userRole == "Doctor" && appointment.DoctorName.ToLower() != doctorName.ToLower())
            {
                return Forbid("You are not authorized to update this appointment.");
            }

            if (statusDto.Status == "Accepted")
            {
                appointment.Status = "Approved";
            }
            else if  (statusDto.Status == "Rejected")
{
                appointment.Status = "Canceled";
                appointment.ProposedNewDate = statusDto.ProposedNewDate;
                appointment.ProposedNewTime = statusDto.ProposedNewTime;
                appointment.CancellationNote = statusDto.CancellationNote;
}
            else
            {
                return BadRequest("Invalid status value.");
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Status updated successfully." });
        }

        // Helper DTO
        public class StatusUpdateDto
        {
            public string Status { get; set; }
            public DateTime? ProposedNewDate { get; set; }
            public string? ProposedNewTime { get; set; }
            public string? CancellationNote { get; set; }
        }

        [HttpPatch("{id}/accept-reschedule")]
[Authorize]
public async Task<IActionResult> AcceptReschedule(int id, [FromBody] AcceptRescheduleDto dto)
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

    var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
    if (appointment == null)
    {
        return NotFound("Appointment not found.");
    }

    appointment.Date = dto.NewDate;
    appointment.Time = dto.NewTime;
    appointment.Status = "Rescheduled";

    // Clear previous suggestion after rescheduling
    appointment.ProposedNewDate = null;
    appointment.ProposedNewTime = null;
    appointment.CancellationNote = null;

    await _context.SaveChangesAsync();

    return Ok(new { message = "Appointment rescheduled successfully." });
}

public class AcceptRescheduleDto
{
    public string NewDate { get; set; }
    public string NewTime { get; set; }
}

    }

    
}
