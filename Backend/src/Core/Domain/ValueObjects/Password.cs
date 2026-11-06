namespace TypeRacerServer.Core.Domain.ValueObjects;

public record Password
{
    public string Value { get; }

    public Password(string value)
    {
        if(string.IsNullOrWhiteSpace(value)) throw new  ArgumentException("Password cannot be null or whitespace.");
        Value = value;
    }

    public static implicit operator Password(string value) => new (value);
    public static implicit operator string(Password value) => value.Value;
}