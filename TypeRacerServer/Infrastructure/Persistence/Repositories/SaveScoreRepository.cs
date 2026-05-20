using Microsoft.EntityFrameworkCore;
using TypeRacerServer.Core.Application.Interfaces.SavingStatsInterfaces;
using TypeRacerServer.Core.Domain.Entities;
using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Infrastructure.Persistance.Repositories;

public class SaveScoreRepository(AppDbContext _context) : ISaveScoreRepository
{
    public async Task<User?> getUser(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task saveScore()
    {
        await _context.SaveChangesAsync();
    }
}