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
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    if (await _context.Users.AnyAsync(u => u.Email == userDto.Email))
        return BadRequest("User already exists");

    userDto.PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.PasswordHash);
    _context.Users.Add(userDto);
    await _context.SaveChangesAsync();
    return Ok("User created");
}


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User userDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(userDto.PasswordHash, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            var claims = new[] {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        }
    }
}
