using Microsoft.EntityFrameworkCore;
using AuthApi.Models;

namespace AuthApi.Data
{
    public class ApplicationDbContext(DbContextOptions options) : DbContext(options)
    {
    public DbSet<User> Users { get;set;}
        public DbSet<Appointment> Appointments { get; set; }

    }
};