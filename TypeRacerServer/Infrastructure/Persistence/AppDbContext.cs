using Microsoft.EntityFrameworkCore;
using TypeRacerServer.Core.Domain.Entities;
using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Infrastructure.Persistance;
public class AppDbContext : DbContext 
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<User> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().Property(u => u.PasswordHash)
            .HasConversion(
                toSave => toSave.Value,
                toRead => new Password(toRead)
            );
        modelBuilder.Entity<User>().Property(u => u.Username).HasConversion(
            toSave => toSave.Value,
            toRead => new Username(toRead)
        );
    }
}
