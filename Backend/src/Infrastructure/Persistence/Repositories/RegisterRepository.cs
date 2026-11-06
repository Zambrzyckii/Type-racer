using Microsoft.EntityFrameworkCore;
using TypeRacerServer.Core.Application.Interfaces.AccountManagerInterfaces;
using TypeRacerServer.Core.Domain.Entities;
using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Infrastructure.Persistance.Repositories;
public class RegisterRepository(AppDbContext _context) : IRegisterRepository
{
    public async Task<bool> Exists(string username)
    {
        return await _context.Users.AnyAsync(u => u.Username == username);
    }

    public async Task SaveNewUser(string nickname, string password)
    {
        var newUser = new User
        {
            Username = nickname,
            PasswordHash = password,
            HighScoreWpm = 0,
            GamesPlayed = 0,
            GamesWin = 0
        };
        await _context.Users.AddAsync(newUser);
        await _context.SaveChangesAsync();
    }
}