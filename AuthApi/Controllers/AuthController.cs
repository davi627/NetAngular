using Microsoft.AspNetCore.Mvc;
using AuthApi.Models;
using AuthApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;

namespace AuthApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

  [HttpPost("register")]
public async Task<IActionResult> Register([FromBody] User userDto)
{
    if (string.IsNullOrEmpty(userDto.Role))
    {
        userDto.Role = "User";
    }

    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    if (await _context.Users.AnyAsync(u => u.Email == userDto.Email))
    {
        return BadRequest("User already exists");
    }

    userDto.PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.PasswordHash);
    _context.Users.Add(userDto);
    await _context.SaveChangesAsync();
    return Ok(new { message = "User created", success = true });
    }

    // GET: api/auth/users
[HttpGet("users")]
public async Task<IActionResult> GetAllUsers()
{
    var users = await _context.Users.ToListAsync();
    return Ok(users);
}

[HttpPut("users/{id}")]
public async Task<IActionResult> UpdateUser(int id, User updatedUser)
{
    var user = await _context.Users.FindAsync(id);
    if (user == null) return NotFound();

    user.Username = updatedUser.Username;
    user.Email = updatedUser.Email;
    if (!string.IsNullOrEmpty(updatedUser.PasswordHash))
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updatedUser.PasswordHash);
    user.Role = updatedUser.Role;

    await _context.SaveChangesAsync();
    return Ok(user);
}

[HttpDelete("users/{id}")]
public async Task<IActionResult> DeleteUser(int id)
{
    var user = await _context.Users.FindAsync(id);
    if (user == null) return NotFound();

    _context.Users.Remove(user);
    await _context.SaveChangesAsync();
    return NoContent();
}




        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User userDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(userDto.PasswordHash, user.PasswordHash))
            {
                return Unauthorized("Invalid credentials");
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                role = user.Role
            });
        }
    }
}
