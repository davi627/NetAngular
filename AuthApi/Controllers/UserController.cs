using Microsoft.AspNetCore.Mvc;
using AuthApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] string role)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.Role = role;
        await _context.SaveChangesAsync();
        return Ok("User role updated");
    }
}
